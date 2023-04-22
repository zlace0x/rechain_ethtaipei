import { useReducer, useState } from "react";

type Field = { name: string; value: string };
const formReducer = (state: Record<string, string>, field: Field) => {
  return {
    ...state,
    [field.name]: field.value,
  };
};

export default function FuruSwap({
  actionParams,
  updateActionParams,
}: {
  actionParams: any;
  updateActionParams: (params: any, isValid?: boolean) => void;
}) {
  const [formData, setFormData] = useReducer(formReducer, actionParams);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (event: React.FormEvent<any>) => {
    event.preventDefault();
    if (errorMessage) return;

    if (formData.sourceToken == formData.targetToken) {
      setErrorMessage("To and from tokens cannot be the same");
      return;
    }
    if (!formData.amount) {
      setErrorMessage("Invalid amount");
      return;
    }

    updateActionParams({ ...formData, dirty: "" }, true);
    setFormData({
      name: "dirty",
      value: "",
    });
  };

  const handleChange = (event: React.ChangeEvent<any>) => {
    setFormData({
      name: "dirty",
      value: "true",
    });
    setErrorMessage("");
    setFormData({
      name: event.target.name,
      value: event.target.value,
    });
  };
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-3 border">
      <div>Swap</div>
      <fieldset>
        <label className="text-sm text-gray-600" htmlFor="sourceToken">
          From
        </label>
        <select
          name="sourceToken"
          id="sourceToken"
          onChange={handleChange}
          value={formData?.sourceToken || ""}
          defaultValue=""
        >
          <option value="" disabled hidden>
            Choose token
          </option>
          <option value="ETH">ETH</option>
          <option value="USDC">USDC</option>
          <option value="WBTC">WBTC</option>
          <option value="WETH">WETH</option>
        </select>
      </fieldset>
      <fieldset>
        <label className="text-sm text-gray-600" htmlFor="targetToken">
          To
        </label>
        <select
          value={formData?.targetToken || ""}
          name="targetToken"
          id="targetToken"
          onChange={handleChange}
          defaultValue=""
        >
          <option value="" disabled hidden>
            Choose token
          </option>
          <option value="ETH">ETH</option>
          <option value="USDC">USDC</option>
          <option value="WBTC">WBTC</option>
          <option value="WETH">WETH</option>
        </select>
      </fieldset>
      <fieldset className="flex flex-col">
        <label className="text-sm text-gray-600" htmlFor="amount">
          Amount ({formData?.sourceToken})
        </label>
        <input
          onChange={handleChange}
          value={formData?.amount ?? ""}
          type="decimal"
          className="rounded ring ring-blue-500"
          name="amount"
          id="amount"
          placeholder="9.99"
        />
      </fieldset>
      {errorMessage && <div className="text-red-500">{errorMessage}</div>}
      <button type="submit">
        {!formData || formData.dirty == "true" ? "Save" : "Saved"}
      </button>
    </form>
  );
}
