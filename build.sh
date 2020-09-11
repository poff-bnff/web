
# ls -lRm assets/img/img_films/* > uusfail.txt
# node ./helpers/compile_film_pictures.js
# node ./helpers/compile_article_pictures.js

printf 'STARTING BUILD FOR: '
printenv DOMAIN
[ ! -d "build/assets" ] && mkdir -p build/assets

echo 'Fetch strapiData.yaml from Strapi'
node ./helpers/a_fetch.js

printf '\n\n---------- Creating separate YAML files from strapiData.yaml ----------\n\n'
echo 'fetch_articles_from_yaml'
node ./helpers/fetch_articles_from_yaml.js

echo 'fetch_films_from_yaml'
node ./helpers/fetch_films_from_yaml.js

echo 'fetch_labels_from_yaml'
node ./helpers/fetch_labels_from_yaml.js

echo 'fetch_footer_from_yaml'
node ./helpers/fetch_footer_from_yaml.js

echo 'fetch_heroarticle_from_yaml'
node ./helpers/fetch_heroarticle_from_yaml.js

echo 'fetch_trioblock_from_yaml'
node ./helpers/fetch_trioblock_from_yaml.js

echo 'fetch_teams_from_yaml'
node ./helpers/fetch_teams_from_yaml.js

echo 'fetch_menu_from_yaml'
node ./helpers/fetch_menu_from_yaml.js

printf '\n----------        FINISHED creating separate YAML files      ----------\n\n\n'

node ./helpers/download_article_img.js
node ./helpers/download_footer_img.js
node ./helpers/download_teams_img.js
node ./helpers/download_trioblock_img.js
cp -R assets/* build/assets/
node ./node_modules/entu-ssg/src/build.js ./entu-ssg.yaml full
