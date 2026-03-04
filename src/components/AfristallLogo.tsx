interface AfristallLogoProps {
  className?: string;
}

const AfristallLogo = ({ className = "h-7 w-7" }: AfristallLogoProps) => (
  <img src="/logo.jpeg" alt="Afristall" className={`${className} rounded-sm object-contain`} />
);

export default AfristallLogo;
