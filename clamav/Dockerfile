FROM clamav/clamav:1.2_base

COPY clamd.conf /etc/clamav/clamd.conf
COPY freshclam.conf /etc/clamav/freshclam.conf
USER clamav
RUN mkdir -p "/tmp/clamav/lib" && mkdir -p "/tmp/clamav/log"
