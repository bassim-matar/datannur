![datannur logo](./data/img/main_banner_dark.png#gh-dark-mode-only)
![datannur logo](./data/img/main_banner.png#gh-light-mode-only)

# datannur

datannur is a portable data catalog able to run without any server.

This is the app (compiled) repo, the source code is in another repo.

To run the app just open the index.html file in a browser.

For more information check the [license](LICENSE.md) and the [website](https://datannur.com).

# Update

To update the app to a newer version you need to run this command :

```
python3 update_app.py
```

You can configure the update in the update_app.json file.

The param *target_version* let you choose between 3 options:
- pre-release : the not yet released version, with the latest modifications
- latest : the latest stable version
- n.n.n : a specific version number you can choose

The param *include* let you choose the list of files and folders to update.

If needed, you can also find the code on github, download and replace any specific file: [https://github.com/bassim-matar/datannur-app](https://github.com/bassim-matar/datannur-app).