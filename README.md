# rcctalk
Powerful command line utility to communicate with RCCService instances

# Screenshot
![](https://github.com/kiseki-lol/rcctalk/raw/trunk/screenshot.png)

# Usage
rcctalk is a console application that can be installed by cloning the repository and then running the command `npm i -g`. You can then easily open the rcctalk shell from the command line by just typing `rcctalk`. For further instructions, please run `rcctalk --help` or type `help` into the shell.

## Example operations
- `OpenJob("sampleJobId123", "return 'Hello world!'")` -> Opens a job and returns `Hello world!`
- `CloseAllJobs()` -> Closes every job on the connected RCCService instance
- `OpenJob("sampleJobId123", 5000, "c:/gameserver.lua", [53640])` -> Opens a job with an expiration of 5000 seconds and passes 53640 as an argument to a script on your computer located at `c:/gameserver.lua`
- `Execute("sampleJobId123", "return a", ["hi there!"])` -> Will return `hi there`, assuming a job with ID `sampleJob123` exists

Optional arguments are denoted with a question mark and don't always have to be set, but if there are multiple optional arguments in a sequence then they must be inputted according to their order denoted in the help menu.

# License
Copyright (c) Kiseki 2023. All rights reserved.