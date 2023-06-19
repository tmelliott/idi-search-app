type Props = {
  n: number;
};

export default function PulseLoader({ n }: Props) {
  return (
    <div className="flex items-center justify-center">
      {Array.from(Array(n).keys()).map((i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full bg-gray-400 animate-pulse ${
            i === 0 ? "" : "ml-1"
          }`}
          style={{
            animationDelay: `${(i * 2) / (n + 1)}s`,
          }}
        ></div>
      ))}
    </div>
  );
}
