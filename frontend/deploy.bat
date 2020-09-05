call npm run build

call cd dist
call echo janggi.snopan.com > CNAME
call git init
call git add -A
call git commit -m "deploy"

call git push -f https://github.com/snopan/janggi.git master:gh-pages
call cd ..