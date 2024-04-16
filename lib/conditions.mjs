export function needsRootUser() {
	if (os.userInfo().uid !== 0) {
		echo`This script needs root to be run.`;

		process.exit(-1);
	}
}
