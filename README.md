# IPOS Program Manager (IPM)
A package manager that resolves programs, projects or packages from `ipfs, npm, github & urls`,<br>


## Some words
sources are added into the `/.sources` directory until the program is installed,
you can keep the packages by using the `--dev` flag.<br>
otherwise the program gets installed and the source files will be deleted (if any).

You can find installed programs in the `/programs` directory.
System wide packages are added into the `/.packages` directory.

#### Options
```
- add <program> <FLAGS> => add to sources & install when --dev flag is unused
- remove => removes program & sources (if any)
- clean => clean up cache entries
- install <program> => installs program from source
- uninstall <program> => uninstall program but keep sources (if any)
- version <program> => retrieve installed program versions (if any)
- whereis <program> => list program caches, sources and installations (if any)
- programs => list all installed programs
- packages <program> => list system wide packages when no program given
```
