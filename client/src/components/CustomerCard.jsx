import { useEffect, useState } from 'react';
import axios from 'axios';

export default function CustomerCard({ id }) {
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`/customers/${id}`)
      .then((res) => setCustomer(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!customer) {
    return <div>Loading customer...</div>;
  }

  return (
    <div>
      <h3>{customer.name}</h3>
      <p>Email: {customer.email}</p>
    </div>
  );
}
