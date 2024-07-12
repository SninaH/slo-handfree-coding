import { dictationMode, functions } from '../functions';


export async function SNAKE_CASE(args: any[]): Promise<dictationMode> {
    try {
        if (args.length !== 1) {
            console.log('Invalid number of arguments');
            return dictationMode.invalid_arguments;
        }
        const snakeCase:string = args[0].split(' ').join('_');
        functions.insert_plain_text([snakeCase]);
        return dictationMode.other;
    }
    catch (e) { console.log(e); return dictationMode.execution_failed; }
}

export async function CAMEL_CASE(args: any[]): Promise<dictationMode> {
    try {
        if (args.length !== 1) {
            console.log('Invalid number of arguments');
            return dictationMode.invalid_arguments;
        }
        // Split the input string into an array of words
        const words = args[0].split(' ');
        // Transform the array of words into camelCase
        const camelCase: string = words.map((word: string, index: number): string => {
            // Keep the first word in lowercase, but capitalize the first letter of subsequent words
            if (index === 0) {
                return word.toLowerCase();
            } else {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
        }).join(''); // Join the words back into a single string without spaces
        functions.insert_plain_text([camelCase]);
        return dictationMode.other;
    }
    catch (e) { console.log(e); return dictationMode.execution_failed; }
}