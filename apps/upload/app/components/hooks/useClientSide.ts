import { useEffect, useState } from "react";

const useClientSide = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
};

export default useClientSide;
