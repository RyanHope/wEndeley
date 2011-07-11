/*=============================================================================
 Copyright (C) 2011 Ryan Hope <rmh3093@gmail.com>

 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 =============================================================================*/

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <signal.h>
#include <syslog.h>
#include <errno.h>
#include <oauth.h>
#include <json.h>
#include <limits.h>

#include <sys/stat.h>
#include <sys/types.h>

#include "threadpool.h"
#include "libpdl/PDL.h"

typedef struct {
	const char *request_token_uri;
  	const char *authorize_token_uri;
  	const char *access_token_uri;
  	const char *req_c_key;
  	const char *req_c_secret;
  	const char *res_t_key;
  	const char *res_t_secret;
  	const char *verifier;
} oauth_t;

typedef struct {
	int r;
	int tr;
	char *id;
} doc_t;

oauth_t *oauth;
threadpool tp;

int mkdirs(const char *path, mode_t mode) {

	int retval;

  	while (0 != (retval = mkdir(path, mode))) {
		char subpath[FILENAME_MAX] = "", *delim;
		if (NULL == (delim = strrchr(path, '\\')))
			return retval;
		strncat(subpath, path, delim - path);
		mkdirs(subpath, mode);
	}

	return retval;

}

PDL_bool plugin_mkdirs(PDL_JSParameters *params) {

	const char *path = NULL;
  	if (PDL_GetNumJSParams(params) < 1 || !(path = PDL_GetJSParamString(params, 0))) {
	    PDL_JSException(params, "You must supply a path");
	    return PDL_TRUE;
	}
	int mode;
	if (PDL_GetNumJSParams(params) < 2 || !(mode = PDL_GetJSParamInt(params, 1))) {
	    PDL_JSException(params, "You must supply a mode");
	    return PDL_TRUE;
	}

  	char *reply = 0;
	if (mkdirs(path, mode)==0) {
		asprintf(&reply, "{'retVal':0}");
	} else {
		asprintf(&reply, "{'retVal':-1,'errrno':%d,'errmsg':'%s'}", errno, strerror(errno));
	}
  	PDL_JSReply(params, reply);
  	free(reply);
  	return PDL_TRUE;
}

PDL_bool plugin_statfile(PDL_JSParameters *params) {

	struct stat st;
	int s = stat(PDL_GetJSParamString(params, 0), &st);

	char *reply = 0;
	if (s==0) {
		asprintf(
				&reply,
				"{'retVal':0,'st_mode':%u,'st_uid':%u,'st_gid':%u,'st_size':%u,'st_atim':%u,'st_mtim':%u,'st_ctim':%u,'st_blksize':%u}",
				st.st_mode, st.st_uid, st.st_gid, st.st_size, st.st_atim, st.st_mtim, st.st_ctim, st.st_blksize);
	} else {
		asprintf(&reply, "{'retVal':-1,'errrno':%d,'errmsg':'%s'}", errno, strerror(errno));
	}
	PDL_JSReply(params, reply);
	free(reply);
	return PDL_TRUE;
}

PDL_bool plugin_init(PDL_JSParameters *params) {

  	const char *res_t_key = PDL_GetJSParamString(params, 5);
  	const char *res_t_secret = PDL_GetJSParamString(params, 6);
	
	oauth->request_token_uri = strdup(PDL_GetJSParamString(params, 0));
  	oauth->authorize_token_uri = strdup(PDL_GetJSParamString(params, 1));
  	oauth->access_token_uri = strdup(PDL_GetJSParamString(params, 2));
  	oauth->req_c_key = strdup(PDL_GetJSParamString(params, 3));
  	oauth->req_c_secret = strdup(PDL_GetJSParamString(params, 4));
  	oauth->verifier = 0;
  	 	
  	if (strlen(res_t_key)==0 || strlen(res_t_secret)==0) {
  	
  		oauth->res_t_key = 0;
  		oauth->res_t_secret = 0;
  		
		char *req_url = oauth_sign_url2(oauth->request_token_uri, NULL, OA_HMAC, NULL, oauth->req_c_key, oauth->req_c_secret, oauth->res_t_key, oauth->res_t_secret);
	  	char *response = oauth_http_get(req_url, NULL);
			
		char *reply = 0;		
		asprintf(&reply, "{\"retVal\":0,\"authorize\":\"%s?%s\"}", oauth->authorize_token_uri, response);
		PDL_JSReply(params, reply);
		
		int rc;
	    char **rv = NULL;
	    rc = oauth_split_url_parameters(response, &rv);
	    
	    qsort(rv, rc, sizeof(char *), oauth_cmpstringp);
	    oauth->res_t_key = strdup(&(rv[1][12]));
		oauth->res_t_secret = strdup(&(rv[2][19]));
		syslog(LOG_ALERT, "key:    '%s'\nsecret: '%s'",oauth->res_t_key, oauth->res_t_secret);
			
		if(rv) free(rv);
		if(req_url) free(req_url);
	  	if(reply) free(reply);
	  	if(response) free(response);
	  	
  	} else {
  	
  		oauth->res_t_key = strdup(res_t_key);
  		oauth->res_t_secret = strdup(res_t_secret);
  		
  		PDL_JSReply(params, "{\"retVal\":0}");
  	
  	}
  	
	return PDL_TRUE;
	

}

PDL_bool plugin_authorize(PDL_JSParameters *params) {

	oauth->verifier = PDL_GetJSParamString(params, 0);
	
	char *url = 0;
	asprintf(&url, "%s?oauth_verifier=%s", oauth->access_token_uri, oauth->verifier);
	syslog(LOG_ALERT, "%s", url);
	
	char *req_url = oauth_sign_url2(url, NULL, OA_HMAC, NULL, oauth->req_c_key, oauth->req_c_secret, oauth->res_t_key, oauth->res_t_secret);
  	char *response = oauth_http_get(req_url, NULL);
	
	free(oauth->res_t_key);
	free(oauth->res_t_secret);
	
  	int rc;
    char **rv = NULL;
    rc = oauth_split_url_parameters(response, &rv);
    
    qsort(rv, rc, sizeof(char *), oauth_cmpstringp);
  	oauth->res_t_key=strdup(&(rv[0][12]));
  	oauth->res_t_secret=strdup(&(rv[1][19]));
    
    char *reply = 0;
    asprintf(&reply, "{\"retVal\":0,\"accessTokens\":[\"%s\",\"%s\"]}", oauth->res_t_key, oauth->res_t_secret);
  	PDL_JSReply(params, reply);
  	
  	if(rv) free(rv);
  	if(url) free(url);
  	if(response) free(response);
  	if(reply) free(reply);
  	if(req_url) free(req_url);

	return PDL_TRUE;

}

void getDocument(void *ptr) {

	doc_t *doc = ptr;

	char *url, *req_url, *response, *param;
	char *params[1];
	json_t *root, *files;

	asprintf(&url, "http://api.mendeley.com/oapi/library/documents/%s", doc->id);
	req_url = oauth_sign_url2(url, NULL, OA_HMAC, NULL, oauth->req_c_key,
	oauth->req_c_secret, oauth->res_t_key, oauth->res_t_secret);
	response = oauth_http_get(req_url, NULL);
	//root = json_parse_document(response);
	//files = json_find_first_label(root, "files");
	//syslog(LOG_ALERT, "Files: %s", response);//files->child->text); 
	//json_free_value(&root);
	
	asprintf(&param, "[%d,%d,%s]", doc->r+1, doc->tr, response);
	params[0] = param;
	PDL_CallJS("pushDocument", params, 1);
	if(param) free(param);

	if(url) free(url);
    if(req_url) free(req_url);
  	if(response) free(response);
  	
	if (doc->id) free(doc->id);
	if (doc) free(doc);
}

void getLibrary() {

	doc_t *doc;
	char *url = 0;
	pthread_t thread[20];
	
	char *req_url, *response;
	json_t *root, *totalResults, *ipp, *ids, *id;
	int cp = 0, tr = 0, r = 0, cont = 1, d, nd = 0;
		
	while (cont) {
		
		d = 0;
	
		asprintf(&url, "http://api.mendeley.com/oapi/library?page=%d", cp);
		req_url = oauth_sign_url2(url, NULL, OA_HMAC, NULL, oauth->req_c_key,
			oauth->req_c_secret, oauth->res_t_key, oauth->res_t_secret);
  		response = oauth_http_get(req_url, NULL);
		root = json_parse_document(response);
		
		if(url) free(url);
	    if(req_url) free(req_url);
	  	if(response) free(response);
               
    	totalResults = json_find_first_label(root, "total_results"); 
    	ipp = json_find_first_label(root, "items_per_page"); 	
    	tr = atoi(totalResults->child->text);
    	nd = atoi(ipp->child->text);
    	
    	if (tr>0) {
    	
	    	ids = json_find_first_label(root, "document_ids");
	    	id = ids->child->child;
	    	
	    	doc = malloc(sizeof(doc_t));
	    	doc->id = strdup(id->text);
	    	doc->r = r;
	    	doc->tr = tr;
	    	sched_yield();
	    	dispatch(tp, getDocument, (void *) doc);
	    	sched_yield();
	    	r++;
	    	
	    	for (d=1;d<nd && r<tr;d++,r++) {
				id = id->next;
				doc = malloc(sizeof(doc_t));
		    	doc->id = strdup(id->text);
		    	doc->r = r;
		    	doc->tr = tr;
		    	sched_yield();
		    	dispatch(tp, getDocument, (void *) doc);
		    	sched_yield();
			}
			
		}
			
		json_free_value(&root);
		
		cp++;
		if (r==tr)
			cont = 0;
		
	}

}

PDL_bool plugin_getLibrary(PDL_JSParameters *params) {
	
	dispatch(tp, getLibrary, NULL);    
    
  	PDL_JSReply(params, "{\"retVal\":0}");

	return PDL_TRUE;

}

int main(int argc, char *argv[]) {

	openlog("us.ryanhope.mendeley.plugin", LOG_PID, LOG_USER);
	
	tp = create_threadpool(30);

	SDL_Init(SDL_INIT_VIDEO);
	PDL_Init(0);
	
	oauth = malloc(sizeof(oauth_t));
	
	PDL_RegisterJSHandler("init", plugin_init);
	PDL_RegisterJSHandler("authorize", plugin_authorize);
	PDL_RegisterJSHandler("getLibrary", plugin_getLibrary);
	PDL_RegisterJSHandler("statfile", plugin_statfile);
	PDL_RegisterJSHandler("mkdirs", plugin_mkdirs);
	
	PDL_JSRegistrationComplete();
	PDL_CallJS("ready", NULL, 0);
	
	SDL_Event Event;
	do {
		SDL_WaitEvent(&Event);
	} while (Event.type != SDL_QUIT);

	PDL_Quit();
  	SDL_Quit();
  	
  	closelog();
  	
  	free(oauth);

	return 0;

}
