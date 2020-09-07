
# ls -lRm assets/img/img_films/* > uusfail.txt
# node ./helpers/compile_film_pictures.js
# node ./helpers/compile_article_pictures.js


mkdir build/assets

node ./helpers/fetch_footer_from_strapi.js
node ./helpers/fetch_heroarticle_from_strapi.js
node ./helpers/fetch_trioblock_from_strapi.js
node ./helpers/fetch_articles_from_strapi.js


node ./download_article_img_w_check.js
node ./download_footer_img.js
node ./download_teams_img.js
node ./download_trioblock_img.js
cp -R assets/* build/assets/
node ./node_modules/entu-ssg/src/build.js ./entu-ssg.yaml full
