echo DOMAIN
echo $DOMAIN

printf '\n----------                Starting serve                    ----------\n\n'

node ./node_modules/entu-ssg/src/serve.js ./entu-ssg.yaml

printf '\n\n----------      Finished serving, press ENTER to exit      ----------\n\n'

read varname
echo $varname
