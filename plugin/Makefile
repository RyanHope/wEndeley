include Makefile.inc

PLUGIN		:=	mendeley

PDLLIB		:=	libpdl

CFLAGS		:=	$(MARCH_TUNE)

INCLUDES	:=	-I${ROOT}/include -I${ROOT}${prefix}/include
								
LIBDIRS		:=	-L$(PDLLIB) -L$(ROOT)${prefix}/lib

LIBS		:=	-lpdl

.PHONY		:	clean clobber

all: $(PLUGIN)

$(PLUGIN): $(OBJECTS) $(PDLLIB)/$(PDLLIB).so
	$(CC) $(CFLAGS) $(LIBDIRS) $(LIBS) sha1.c mendeley.c -o $(PLUGIN)

.PHONY: $(PDLLIB)/$(PDLLIB).so
$(PDLLIB)/$(PDLLIB).so:
	cd $(PDLLIB); $(MAKE)

push: 

clobber: clobber-$(PDLLIB)
	rm -rf *.o $(PLUGIN)
	
clobber-$(PDLLIB):
	cd $(PDLLIB); $(MAKE) clean

clean: clobber
