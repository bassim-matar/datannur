![datannur logo](./assets/main_banner_dark.png#gh-dark-mode-only)
![datannur logo](./assets/main_banner.png#gh-light-mode-only)

# datannur

datannur is a portable data catalog that can run without a server.

This repository contains the built version of the app.
If you're looking for the source code, you can find it in this repository: [datannur](https://github.com/bassim-matar/datannur).

To run the app just open the index.html file in a browser.

Before using please review the full [License](LICENSE.md).

For more information check the [website](https://datannur.com).

## Update

To update the app to a newer version you need to run this command :

```
python3 update_app.py
```

You can configure the update in the update_app.json file.

The param _target_version_ let you choose between 3 options:

- pre-release : the not yet released version, with the latest modifications
- latest : the latest stable version
- n.n.n : a specific version number you can choose

The param _include_ let you choose the list of files and folders to update.

If needed, you can also find the code on github, download and replace any specific file: [https://github.com/bassim-matar/datannur-app](https://github.com/bassim-matar/datannur-app).
