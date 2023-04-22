import React from "react";

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export function NumericalInput({
  value,
  onUserInput,
  className = "",
  inputRef,
  placeholder,
  disabled,
  integer = false,
  maxLength = 10,
}: {
  value: string | number;
  onUserInput: (input: string) => void;
  error?: boolean;
  fontSize?: string;
  inputRef?: React.RefObject<any>;
  placeholder?: string;
  disabled?: boolean;
  integer?: boolean;
  maxLength?: number;
} & Omit<React.HTMLProps<HTMLInputElement>, "ref" | "onChange" | "as">) {
  const inputRegex = integer ? RegExp(`^\\d*?\\d*$`) : RegExp(`^\\d*(?:\\\\[.])?\\d*$`);
  const validate = (nextUserInput: string) => {
    if (nextUserInput === ".") {
      nextUserInput = "0.";
    }
    if (nextUserInput === "" || inputRegex.test(escapeRegExp(nextUserInput))) {
      onUserInput(nextUserInput);
    }
  };
  return (
    <input
      ref={inputRef}
      className={className}
      inputMode={integer ? "numeric" : "decimal"}
      autoComplete="off"
      disabled={disabled}
      autoCorrect="off"
      type="text"
      placeholder={placeholder || "0.0"}
      minLength={1}
      maxLength={maxLength}
      spellCheck="false"
      onChange={(evt) => validate(evt.target.value.replace(/,/g, "."))}
      value={value}
    />
  );
}
