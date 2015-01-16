deploy:
	git checkout master
	jekyll build
	git add -A
	git commit -m "update source"
	cp -r _site ~/tmp/
	git checkout gh-pages
	rm -rf *
	cp -r ~/tmp/_site/* ./
	rm -rf ~/tmp/_site/./*
	git add -A
	git commit -m "deploy blog"
	git push origin gh-pages
	git checkout master
	echo "deploy succeed"
	git push origin master
	echo "push master"
 