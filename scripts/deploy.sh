#!/bin/bash
USERNAME=parkman
INSTANCE_URL=veiligstallen.addbrainz.com

echo update remote veiligstallen.addbrainz.com
ssh -o StrictHostKeyChecking=no $USERNAME@$INSTANCE_URL "bash -s" < ./remote/update-veiligstallen.sh >> ./updatelog.txt 2>> ./updatelog.txt