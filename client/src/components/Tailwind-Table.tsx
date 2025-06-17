import { JSX } from "preact";

interface Action<T> {
  type: string;
  icon: JSX.Element;
  handler: (id: string, index?: number) => void;
  condition?: (row: T) => boolean;
  tooltip: string;
}

interface TableProps<T> {
  header: { label: string; key: string; render?: any }[];
  data: T[];
  actions?: Action<T>[];
}
const TailwindTable = <T extends { [key: string]: any }>({
  header,
  data,
  actions,
}: TableProps<T>) => {
  return (
    <div className="font-space-grotesk">
      <div className="max-w-full overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-primary-400 text-main-black">
            <tr>
              {header.map((col, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-[14px] font-bold uppercase"
                >
                  {col.label}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-left text-[14px] font-bold uppercase">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-100">
                {header.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className="text-[14px] px-4 py-4 whitespace-nowrap truncate"
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                <td className="flex gap-2 items-center justify-start px-4 py-4">
                  {actions?.map((action, actionIndex) =>
                    action.condition ? (
                      action.condition(row) && (
                        <button
                          key={actionIndex}
                          className={`text-2xl ${action.type === "delete" ? "text-red-700" : ""
                            }`}
                          onClick={() => action.handler(row["id"] as string)}
                          title={action.tooltip}
                        >
                          {action.icon}
                        </button>
                      )
                    ) : (
                      <button
                        key={actionIndex}
                        className={`text-2xl ${action.type === "delete" ? "text-red-700" : ""
                          }`}
                        onClick={() => action.handler(row["id"] as string, rowIndex)}
                        title={action.tooltip}
                      >
                        {action.icon}
                      </button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default TailwindTable;
