import * as core from "@actions/core";

export class Input {
  public static getInput<T>(
    inputName: string,
    required: boolean,
    convert: (value: string) => T
  ): T {
    const input = core.getInput(inputName, { required: required });
    core.debug("Input: " + inputName + " = " + input);
    return convert(input);
  }

  public static getInputAsString(inputName: string, required: boolean): string {
    const input = core.getInput(inputName, { required: required });
    core.debug("Input: " + inputName + " = " + input);
    return input;
  }

  public static convertToBoolean(value: string): boolean {
    if (value == "true" || value == "True" || value == "TRUE") {
      return true;
    } else if (value == "false" || value == "False" || value == "FALSE") {
      return false;
    }

    throw new Error(value + " can not converted into boolean");
  }
}
