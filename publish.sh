#!/bin/sh

# replace debug
sed -i "s/DEBUG = 1/DEBUG = 0/g" mute.js
head mute.js

# zip and revert the change
zip -r publish.zip * -x .git -x publish.sh -x publish.zip
sed -i "s/DEBUG = 0/DEBUG = 1/g" mute.js
