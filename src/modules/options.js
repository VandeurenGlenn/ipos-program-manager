export const validateOptions = async (program, {
  add,
  install,
  remove,
  uninstall,
  version,
  update,
  whereis,
  packages,
  programs }) => {
  if (!program && !update) return console.error('No program to install');
  if (!add && !install && !remove && !uninstall && !version && !whereis && !packages && !programs) throw new Error('expected add, install, remove, uninstall, whereis, packages, programs or version to be true')
}

export const transformOptions = options => {
  if (options.add && !options.dev) options.install = true;
  return options;
}
