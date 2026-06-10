const Loader = ({ size }: { size: number }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderWidth: Math.round(size / 5),
      }}
      className={`animate-spin relative rounded-full border m-auto block`}
    >
      <div
        style={{ height: size, translate: `50% -${Math.round(size) / 5}px` }}
        className="bars w-1/2 absolute top-0 "
      ></div>
      <div
        style={{ height: size, translate: `50% -${Math.round(size) / 5}px` }}
        className="bars w-1/2 absolute top-0 -translate-y-1 rotate-90 "
      ></div>
    </div>
  );
};

export default Loader;
