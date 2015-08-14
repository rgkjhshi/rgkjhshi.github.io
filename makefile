deploy:
	# 本地 master 分支
	git checkout master
	# 编译得到静态页面
	jekyll build
	# 添加并提交到本地master
	git add -A
	git commit -m "update source"
	# 把静态页面暂存
	cp -r _site ~/tmp/
	# 切换到本地 gh-pages 分支
	git checkout gh-pages
	# 新页面替换掉旧页面
	rm -rf *
	cp -r ~/tmp/_site/* ./
	# 移除暂存
	rm -rf ~/tmp/_site 
	# 添加并提交到本地 gh-pages 分支
	git add -A
	git commit -m "deploy blog"
	# 推送到 github gh-pages 分支
	git push github gh-pages
	# 推送到 gitcafe gh-pages 分支
	git push gitcafe gh-pages
	# 切换到本地 master 分支
	git checkout master
	# 推送到 github master 分支
	git push github master
	# 推送到 gitcafe master 分支
	git push gitcafe master
 
