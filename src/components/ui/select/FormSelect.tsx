import {
  Controller,
  type ControllerProps,
  type FieldValues,
} from "react-hook-form";
import { Select } from "./Select";

export interface BaseOption {
  id: number | string;
  label: string;
}


type FormSelectProps<
  TForm extends FieldValues,
  TOption extends BaseOption
> = Omit<
  ControllerProps<TForm>,
  "render"
> & {
  options: TOption[];
};

export function FormSelect<
  TForm extends FieldValues,
  TOption extends BaseOption
>({
  options,
  ...controllerProps
}: FormSelectProps<TForm, TOption>): React.ReactElement {
  return (
    <Controller
      {...controllerProps}
      render={({ field }) => {
        const selected =
          options.find((o) => o.id === field.value) ?? null;

        return (
          <Select<TOption>
            value={selected}
            options={options}
            onChange={(opt) => field.onChange(opt?.id)}
            getOptionKey={(u) => u.id}
            renderValue={(u) => <span>{u.label}</span>}
            renderOption={(u) => <span>{u.label}</span>}
          />
        );
      }}
    />
  );
}
