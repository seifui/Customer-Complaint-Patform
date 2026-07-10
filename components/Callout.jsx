export default function Callout({ kind = 'acc', children, style }) {
  return (
    <div className={'callout callout-' + kind} style={style}>
      {children}
    </div>
  );
}
