npm run build && rsync -rave 'ssh -i ~/.ssh/meet-h5.pem' ./dist/* root@47.106.150.99:/var/www/meet-h5/pure-static/rex/ && rsync -rave 'ssh -i ~/.ssh/meet-hk.pem' ./dist/* root@47.75.240.16:/var/www/meet/pure-static/rex/
exit 0
