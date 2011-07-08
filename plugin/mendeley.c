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

#include "sha1.h"
#include "libpdl/PDL.h"

int mkdirs(const char *path) {

	int retval;
	
  	while (0 != (retval = mkdir(path))) {
		char subpath[FILENAME_MAX] = "", *delim;
		if (NULL == (delim = strrchr(path, '\\')))
			return retval;
		strncat(subpath, path, delim - path);
		mkdirs(subpath);
	}
	
	return retval;
	
}

PDL_bool plugin_mkdirs(PDL_JSParameters *params) {

	const char *path = NULL;
  	if (PDL_GetNumJSParams(params) < 1 || !(path = PDL_GetJSParamString(params, 0))) {
	    PDL_JSException(params, "You must supply a path");
	    return PDL_TRUE;
	}
	
  	char reply[32];
  	snprintf(reply, 32, "{'retVal':%d}", mkdirs(path));
  	PDL_JSReply(params, reply);
	
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

  	infile = fopen("/etc/conf.d/acpid", "r");

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

  	char reply[1024];

  	snprintf(reply, 1024, "{'retVal':0,'sha1':'%s'}",sha1_to_hex(sha1));
  	PDL_JSReply(params, reply);

  	free(buffer);

  	return PDL_TRUE;

  	fail:

  	snprintf(reply, 1024, "{'retVal':1}");
	PDL_JSReply(params, reply);

  	return PDL_TRUE;

}

int main(int argc, char *argv[]) {

	SDL_Init(SDL_INIT_VIDEO);
	PDL_Init(0);
	
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

	return 0;

}
