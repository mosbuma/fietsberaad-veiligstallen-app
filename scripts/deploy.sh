#!/bin/bash
USERNAME=parkman
INSTANCE_URL=beta.veiligstallen.nl

echo update remote $INSTANCE_URL
ssh -o StrictHostKeyChecking=no $USERNAME@$INSTANCE_URL "bash -s" < ./remote/update-veiligstallen.sh >> ./updatelog.txt 2>> ./updatelog.txt