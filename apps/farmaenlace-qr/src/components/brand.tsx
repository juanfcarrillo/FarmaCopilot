import Image from 'next/image';

export function Brand() {
  return <div className="brand"><Image src="/farmaenlace-logo.svg" alt="Farmaenlace" width={290} height={53} priority /></div>;
}
