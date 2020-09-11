
# ls -lRm assets/img/img_films/* > uusfail.txt
# node ./helpers/compile_film_pictures.js
# node ./helpers/compile_article_pictures.js

echo 'Starting'
[ ! -d "build/assets" ] && mkdir -p build/assets


echo 'fetch_articles_from_strapi'
node ./helpers/fetch_articles_from_strapi.js

echo 'fetch_films_from_strapi'
node ./helpers/fetch_films_from_strapi.js

echo 'fetch_labels_from_strapi'
node ./helpers/fetch_labels_from_strapi.js

echo 'fetch_footer_from_strapi'
node ./helpers/fetch_footer_from_strapi.js

echo 'fetch_heroarticle_from_strapi'
node ./helpers/fetch_heroarticle_from_strapi.js

echo 'fetch_trioblock_from_strapi'
node ./helpers/fetch_trioblock_from_strapi.js

echo 'fetch_teams_from_strapi'
node ./helpers/fetch_teams_from_strapi.js

echo 'fetch_menu_from_strapi'
node ./helpers/fetch_menu_from_strapi.js


node ./helpers/download_article_img.js
node ./helpers/download_footer_img.js
node ./helpers/download_teams_img.js
node ./helpers/download_trioblock_img.js
cp -R assets/* build/assets/
node ./node_modules/entu-ssg/src/build.js ./entu-ssg.yaml full
