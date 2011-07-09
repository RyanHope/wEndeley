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

#include <sys/stat.h>
#include <sys/types.h>

#include "sha1.h"
#include "libpdl/PDL.h"

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

PDL_bool plugin_sha1file(PDL_JSParameters *params) {

	FILE    *infile;
	char    *buffer;
	long    numbytes;
	int	i;

	const char *path = NULL;
  	if (PDL_GetNumJSParams(params) < 1 || !(path = PDL_GetJSParamString(params, 0))) {
	    PDL_JSException(params, "You must supply a path");
	    return PDL_TRUE;
	}

  	infile = fopen(path, "r");

	if(infile == NULL)
		goto fail;

	fseek(infile, 0L, SEEK_END);
	numbytes = ftell(infile);

	fseek(infile, 0L, SEEK_SET);

	buffer = (char*)calloc(numbytes, sizeof(char));

	if(buffer == NULL)
		goto fail;

	fread(buffer, sizeof(char), numbytes, infile);
	fclose(infile);

	blk_SHA_CTX ctx;
	unsigned char sha1[20];
	unsigned bufsz = 8192;
	if (!bufsz)
		bufsz = 8192;

	blk_SHA1_Init(&ctx);
	blk_SHA1_Update(&ctx, buffer, numbytes);
	blk_SHA1_Final(sha1, &ctx);

  	char *reply = 0;

  	asprintf(&reply, "{'retVal':0,'sha1':'%s'}",sha1_to_hex(sha1));
  	PDL_JSReply(params, reply);

  	free(buffer);
  	free(reply);

  	return PDL_TRUE;

  	fail:

  	asprintf(&reply, "{'retVal':1}");
	PDL_JSReply(params, reply);
	free(reply);
	
  	return PDL_TRUE;

}

int main(int argc, char *argv[]) {

	openlog("us.ryanhope.mendeley.plugin", LOG_PID, LOG_USER);

	SDL_Init(SDL_INIT_VIDEO);
	PDL_Init(0);
	
	PDL_RegisterJSHandler("statfile", plugin_statfile);
	PDL_RegisterJSHandler("sha1file", plugin_sha1file);
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

	return 0;

}
