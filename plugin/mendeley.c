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
#include <openssl/sha.h>

#include <sys/stat.h>
#include <sys/types.h>

#include "oauth.h"
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
	char *id;
	char *hash;
	char *path;
} file_t;

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

PDL_bool plugin_request(PDL_JSParameters *params) {

	char *req_url = oauth_sign_url2(oauth->request_token_uri, NULL, OA_HMAC, NULL, oauth->req_c_key, oauth->req_c_secret, oauth->res_t_key, oauth->res_t_secret);
	syslog(LOG_ALERT, "%s", req_url);
  	char *response = oauth_http_get(req_url, NULL, NULL);
  	syslog(LOG_ALERT, "%s", response);
	
	int rc;
    char **rv = NULL;
    rc = oauth_split_url_parameters(response, &rv);
    
	if (rc!=4) {
	
		PDL_JSReply(params, "{\"retVal\":1}");
	
	} else {
	
		/*if (oauth->res_t_key) free(oauth->res_t_key);
		if (oauth->res_t_secret) free(oauth->res_t_secret);
	    
	    qsort(rv, rc, sizeof(char *), oauth_cmpstringp);
	    oauth->res_t_key = strdup();
		oauth->res_t_secret = strdup();*/
		
		char *reply = 0;		
		asprintf(&reply, "{\"retVal\":0,\"url\":\"%s?%s\",\"key\":\"%s\",\"secret\":\"%s\"}", oauth->authorize_token_uri, response, &(rv[1][12]), &(rv[2][19]));
		PDL_JSReply(params, reply);
	
		if(reply) free(reply);
		
	}
		
	if(rv) free(rv);
	if(req_url) free(req_url);
  	if(response) free(response);
  	
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
  	 	
  	if (strlen(res_t_key)==0 || strlen(res_t_secret)==0) {	
  		PDL_JSReply(params, "{\"retVal\":0,\"authorized\":0}");
  	} else {
  		oauth->res_t_key = strdup(res_t_key);
  		oauth->res_t_secret = strdup(res_t_secret);
  		PDL_JSReply(params, "{\"retVal\":0,\"authorized\":1}");
  	}
  	
	return PDL_TRUE;
	
}

PDL_bool plugin_authorize(PDL_JSParameters *params) {

	oauth->verifier = PDL_GetJSParamString(params, 0);
	char *key = PDL_GetJSParamString(params, 1);
	char *secret = PDL_GetJSParamString(params, 2);
	
	syslog(LOG_ALERT, "%s %s %s", oauth->verifier, key, secret);
	
	char *url = 0;
	asprintf(&url, "%s?oauth_verifier=%s", oauth->access_token_uri, oauth->verifier);
	
	char *req_url = oauth_sign_url2(url, NULL, OA_HMAC, NULL, oauth->req_c_key, oauth->req_c_secret, key, secret);
  	char *response = oauth_http_get(req_url, NULL, NULL);
	
  	int rc;
    char **rv = NULL;
    rc = oauth_split_url_parameters(response, &rv);
    
    if (rc==1) {
    
    	PDL_JSReply(params, "{\"retVal\":1}");
	
	} else {
	
		syslog(LOG_ALERT, "PARAMS: %d", rc);
		
		free(oauth->res_t_key);
		free(oauth->res_t_secret);
    
	    qsort(rv, rc, sizeof(char *), oauth_cmpstringp);
	  	oauth->res_t_key = strdup(&(rv[0][12]));
	  	oauth->res_t_secret = strdup(&(rv[1][19]));
	    
	    char *reply = 0;
	    asprintf(&reply, "{\"retVal\":0,\"accessTokens\":[\"%s\",\"%s\"]}", oauth->res_t_key, oauth->res_t_secret);
	  	PDL_JSReply(params, reply);
  		if(reply) free(reply);
  		
  	}
  	
  	if(rv) free(rv);
  	if(url) free(url);
  	if(response) free(response);
  	if(req_url) free(req_url);

	return PDL_TRUE;

}

void getDocument(void *ptr) {

	char *id = ptr;

	char *url, *req_url, *response;
	char *params[1];
	json_t *root, *files;

	asprintf(&url, "http://api.mendeley.com/oapi/library/documents/%s", id);
	req_url = oauth_sign_url2(url, NULL, OA_HMAC, NULL, oauth->req_c_key,
	oauth->req_c_secret, oauth->res_t_key, oauth->res_t_secret);
	response = oauth_http_get(req_url, NULL, NULL);
	
	params[0] = response;
	PDL_CallJS("pushDocument", params, 1);

	free(id);
	free(url);
    free(req_url);
  	free(response);
  	
}

json_t * getLibraryPage(int page) {
	
	json_t *root;
	char *req_url, *response, *url;

	asprintf(&url, "http://api.mendeley.com/oapi/library?page=%d", page);
	req_url = oauth_sign_url2(url, NULL, OA_HMAC, NULL, oauth->req_c_key,
		oauth->req_c_secret, oauth->res_t_key, oauth->res_t_secret);
	response = oauth_http_get(req_url, NULL, NULL);
	root = json_parse_document(response);
	
	free(url);
    free(req_url);
  	free(response);
  	
  	return root;
  	
}

char *sha1File(char *filename) {

	FILE *infile;
	unsigned char sha[20];
	unsigned char hash[81];
	char *buffer;
	long numbytes;

	infile = fopen(filename, "r");
	if (infile == NULL) return NULL;
	
	fseek(infile, 0L, SEEK_END);
	numbytes = ftell(infile);

	fseek(infile, 0L, SEEK_SET);

	buffer = (char*)calloc(numbytes, sizeof(char));

	if (buffer == NULL) return NULL;
	
	fread(buffer, sizeof(char), numbytes, infile);
	fclose(infile);
	
	SHA1(buffer, numbytes, sha);
	snprintf(hash, 81, "%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x",
		sha[0],sha[1],sha[2],sha[3],sha[4],sha[5],sha[6],sha[7],sha[8],sha[9],
		sha[10],sha[11],sha[12],sha[13],sha[14],sha[15],sha[16],sha[17],sha[18],sha[19]);
		
	free(buffer);
	
	return strdup(hash);
}

void fetchFile(file_t *file) {
	
  FILE *testfile = NULL;
	FILE *outfile = NULL;
	char *req_url = NULL, *url = NULL;
	struct MemoryStruct header;
	struct MemoryStruct response;


  asprintf(&url, "http://api.mendeley.com/oapi/library/documents/%s/file/%s", file->id, file->hash);
	
	header.size = 0;
	header.data = NULL;
	response.size = 0;
	response.data = NULL;
	
	req_url = oauth_sign_url2(url, NULL, OA_HMAC, NULL, oauth->req_c_key,
		oauth->req_c_secret, oauth->res_t_key, oauth->res_t_secret);
	if (oauth_http_get3(req_url, NULL, &response, &header)>0)
		goto cleanup;

	outfile = fopen(file->path, "w");
	fwrite(response.data, 1, response.size, outfile);
	fclose(outfile);

	free(response.data);
	free(header.data);
	
  cleanup:
	free(url);
	free(file->id);
	free(file->hash);
	free(file->path);
	free(file);
    free(req_url);
  	
}

void getLibrary() {

	json_t *root = 0, *ids, *id;
	int total_results = 0, total_pages = 0, current_page = 0;
	char *tr;
	
	int count = 0;
	char **document_ids = 0;
	
	do {
		if (root)
			json_free_value(&root);
		root = getLibraryPage(current_page);
		total_pages = atoi(json_find_first_label(root, "total_pages")->child->text);
		tr = json_find_first_label(root, "total_results")->child->text;
		total_results = atoi(tr);
		if (!document_ids)
			document_ids = malloc(total_results*sizeof(char*)); 
		ids = json_find_first_label(root, "document_ids");
		for (id=ids->child->child;id;id = id->next)
			document_ids[count++] = strdup(id->text);
	} while(current_page++ < total_pages-1);
	
	char *params[1];
	params[0] = tr;
	PDL_CallJS("setLibrarySize", params, 1);
	if (root)
		json_free_value(&root);
		
	count--;
	while (count>=0)
		dispatch(tp, getDocument, (void *) document_ids[count--]);		

}

// Determine if the file exists, and verify hash
// Returns 1 iff the file exists and hash checks out
PDL_bool plugin_checkFile(PDL_JSParameters *params) {
  // Demarshal the arguments
  const char * name = PDL_GetJSParamString(params, 0);
  const char * hash = PDL_GetJSParamString(params, 1);
  const char * path = PDL_GetJSParamString(params, 2);
  
  static const char * REPLY_NOFILE = "{\"retVal\":0}";
  static const char * REPLY_VALIDFILE = "{\"retVal\":1}";

  // Verify arguments...kinda
  if (!name || !hash || !path) return PDL_FALSE;

  // Check hash on file, if it exists
  char * actualhash = sha1File(path);
  if (!actualhash) {
    // File doesn't exist
    PDL_JSReply(params, REPLY_NOFILE);

    return PDL_TRUE;
  }

  // Check if the hash matches
  char match = !strcmp(actualhash,hash);
  free(actualhash);

  if (match) {
    PDL_JSReply(params, REPLY_VALIDFILE);

    return PDL_TRUE;
  }

  // Hmm. File exists, but hash check failed.
  // Remove the file and report file doesn't exist.
  syslog(LOG_ALERT, "Found existing file %s with incorrect hash!", path);

  unlink(path);

  PDL_JSReply(params, REPLY_NOFILE);

  return PDL_TRUE;
}

PDL_bool plugin_fetchFile(PDL_JSParameters *params) {

	file_t *file = malloc(sizeof(file_t));

	file->id = strdup(PDL_GetJSParamString(params, 0));
  	file->hash = strdup(PDL_GetJSParamString(params, 1));
  	file->path = strdup(PDL_GetJSParamString(params, 2));
  	 	
	dispatch(tp, fetchFile, file);
    
  	PDL_JSReply(params, "{\"retVal\":0}");

	return PDL_TRUE;

}

PDL_bool plugin_getLibrary(PDL_JSParameters *params) {
	
	dispatch(tp, getLibrary, NULL);    
    
  	PDL_JSReply(params, "{\"retVal\":0}");

	return PDL_TRUE;

}

PDL_bool plugin_getGroups(PDL_JSParameters *params) {
	
	char *req_url, *response, *url, *reply;

	req_url = oauth_sign_url2("http://api.mendeley.com/oapi/library/groups", NULL, OA_HMAC, NULL, oauth->req_c_key,
		oauth->req_c_secret, oauth->res_t_key, oauth->res_t_secret);
	response = oauth_http_get(req_url, NULL, NULL);
    
    asprintf(&reply, "{\"retVal\":0,\"response\":%s}", response);
    
  	PDL_JSReply(params, reply);
  	
    free(req_url);
  	free(response);
  	free(reply);

	return PDL_TRUE;

}

PDL_bool plugin_deleteDocument(PDL_JSParameters *params) {
	
	char *req_url, *response, *url, *reply;
	
	char *id = PDL_GetJSParamString(params, 0);

	asprintf(&url, "http://api.mendeley.com/oapi/library/documents/%s/", id);
	req_url = oauth_sign_url2(url, NULL, OA_HMAC, "DELETE", oauth->req_c_key,
		oauth->req_c_secret, oauth->res_t_key, oauth->res_t_secret);
	syslog(LOG_ALERT, "%s", req_url);
	response = oauth_http_delete(req_url);
    
    asprintf(&reply, "{\"retVal\":0,\"response\":\"%s\"}", response);
    
  	PDL_JSReply(params, reply);
  	
	free(url);
    free(req_url);
  	free(response);
  	free(reply);

	return PDL_TRUE;

}

int main(int argc, char *argv[]) {

	openlog("us.ryanhope.mendeley.plugin", LOG_PID, LOG_USER);
	
	tp = create_threadpool(30);

	SDL_Init(SDL_INIT_VIDEO);
	PDL_Init(0);
	
	oauth = malloc(sizeof(oauth_t));
	memset(oauth, 0, sizeof(oauth_t));
	
	PDL_RegisterJSHandler("init", plugin_init);
	PDL_RegisterJSHandler("request", plugin_request);
	PDL_RegisterJSHandler("authorize", plugin_authorize);
	PDL_RegisterJSHandler("getLibrary", plugin_getLibrary);
	PDL_RegisterJSHandler("statfile", plugin_statfile);
  PDL_RegisterJSHandler("checkFile", plugin_checkFile);
	PDL_RegisterJSHandler("mkdirs", plugin_mkdirs);
	PDL_RegisterJSHandler("fetchFile", plugin_fetchFile);
	PDL_RegisterJSHandler("getGroups", plugin_getGroups);
	PDL_RegisterJSHandler("deleteDocument", plugin_deleteDocument);
	
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
