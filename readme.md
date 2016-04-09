# mdn.vim

Wrapper on top of `mdn-cli` for nvim. Provides a `:Mdn <search terms>` command
to query http://mdn.io, parse the HTML result and fill in a vertical buffer
with MDN documentation.

Mainly do play around with neovim's remote plugin API.

**Usable only with neovim, unless rplugin/node code is ported over to vimscript**

### Installation

- Install [node-host](https://github.com/neovim/node-host).
- Extract the files and put them in your VIM directory (usually `~/.vim/`)

If you don't have a preferred installation method, I recommend installing
[vim-plug](https://github.com/junegunn/vim-plug) and using the following configuration:

    Plug 'neovim/node-host'
    Plug 'mklabs/mdn.vim'

### :Mdn `<search term>`

Accepts n* number of arguments. Will vertical split a non modifiable buffer
with the content of the relevant MDN page.
