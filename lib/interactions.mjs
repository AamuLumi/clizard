function formatOptions(options) {
	let result = [];

	if (options.defaultValue) {
		result.push(`default: ${options.defaultValue}`);
	}
	if (options.noEmpty) {
		result.push('required');
	}
	if (options.noSpaces) {
		result.push('no spaces');
	}
	if (options.answerType === 'number') {
		result.push('number only');
	}

	let resultFormatted = result.join(' | ');

	if (resultFormatted) {
		return `(${resultFormatted})`;
	}

	return '';
}

function validateAnswerWithOptions(answer, options) {
	if (options.noEmpty && !answer) {
		echo`/!\\ Invalid answer: answer cannot be empty.`;
		return false;
	}
	if (options.noSpaces && answer.indexOf(' ') !== -1) {
		echo`/!\\ Invalid answer: answer cannot contain spaces.`;
		return false;
	}
	if (options.answerType === 'number' && isNaN(parseInt(answer, 10))) {
		echo`/!\\ Invalid answer: answer must be a number.`;
		return false;
	}

	return true;
}

/**
 * Ask a question to the user and returns the formatted answer.
 * @param {string} text to ask
 * @param options
 * @param {'string' | 'number'} [options.answerType]
 * @param {string | number} [options.defaultValue]
 * @param {boolean} [options.noEmpty]
 * @param {boolean} [options.noSpaces]
 * @returns {Promise<string|number>}
 */
export async function askUser(text, options = {
	answerType: 'string',
	defaultValue: '',
	noEmpty: false,
	noSpaces: false,
}) {
	let answer = '';
	let isAnswerCorrect = false;
	const formattedQuestion = `${text} ${formatOptions(options)} `;

	while (!isAnswerCorrect) {
		answer = await question(formattedQuestion);

		isAnswerCorrect = validateAnswerWithOptions(answer, options);
	}

	if (options.answerType === 'number') {
		return parseInt(answer, 10);
	}

	if (!answer && options.defaultValue) {
		return options.defaultValue;
	}

	return answer;
}
