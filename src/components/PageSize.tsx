type Props = {
  value: number;
  setter: (value: number) => void;
  options?: number[];
};

const PageSize = ({
  value,
  setter,
  options = [10, 20, 50, 100, 500],
}: Props) => {
  return (
    <div className="flex items-center justify-end text-sm px-4">
      <label htmlFor="perPage" className="mr-2">
        Results per page:
      </label>
      <select
        name="perPage"
        value={value}
        onChange={(e) => setter(Number(e.target.value))}
        className="p-2 rounded"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PageSize;
