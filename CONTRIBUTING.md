Contributing - html-duration-picker
=======

Contributions and suggestions are very welcome and wanted. I try to respond to pull requests within 48 hours. To contribute simply

1. Fork the repository.

	[How do I do this?](https://help.github.com/en/github/getting-started-with-github/fork-a-repo#fork-an-example-repository)

2. Clone your forked repository and setup development environment

	```
	git clone https://github.com/YOUR-USERNAME/html-duration-picker.js
	cd html-duration-picker.js
	npm install
	```
	Resources:
	* https://git-scm.com/book/en/v2/Getting-Started-Installing-Git
	* https://www.taniarascia.com/how-to-install-and-use-node-js-and-npm-mac-and-windows/
	

3. Make the fix or add feature to ```src/html-duration-picker.js```

	OPTIONAL:
	To preview locally on a development server, run
	```
	npm run dev
	```

4. Run tests to make sure there are no lint errors

	```
	npm test
	```

5. Sync your fork to make sure you have the latest changes.
 	
	```
	# Fetch upstream master and merge with your repo's master branch
	git fetch upstream
	git checkout master
	git merge upstream/master

	# If there were any new commits, rebase your development branch
	git checkout newfeature
	git rebase master
	```
	Resources:
	* https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/syncing-a-fork
	* https://gist.github.com/Chaser324/ce0505fbed06b947d962#cleaning-up-your-work
6. Create a pull request.

	Resources:
	* https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request-from-a-fork
	* https://gist.github.com/Chaser324/ce0505fbed06b947d962
	
7. Wait for the maintainer to respond. 

Thank you for you for your awesome contribution :-)
