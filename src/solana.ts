import pkg from 'bs58';
const { decode } = pkg;

(() => {
  const decoded = decode(
    '2gb5e548tgv65HprKYEqZNspr6LGdmitJe7Jqs8Qsw2MwbP2LDcedBxopKZ9TpUB5kaCzpgVNATGBuYRMYijkR4J'
  );
  console.log(JSON.stringify(Array.from(decoded)));
})();
