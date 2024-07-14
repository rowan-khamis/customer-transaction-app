import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const CustomerTable = () => {
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:8000/customers')
      .then(response => response.json())
      .then(data => {
        console.log('Customers:', data);
        setCustomers(data);
      });

    fetch('http://localhost:8000/transactions')
      .then(response => response.json())
      .then(data => {
        console.log('Transactions:', data);
        setTransactions(data);
      })
      .catch(error => console.error('Error fetching transactions:', error));
  }, []);

  const customerTransactions = customers.map(customer => {
    const customerTransactions = transactions.filter(transaction => transaction.customer_id === parseInt(customer.id));
    return { ...customer, transactions: customerTransactions };
  });

  const filteredCustomerTransactions = customerTransactions.filter(customer => {
    const customerNameMatches = customer.name.toLowerCase().includes(filterText.toLowerCase());
    const transactionAmountMatches = customer.transactions.some(transaction => transaction.amount === parseInt(filterText, 10));
    return customerNameMatches || transactionAmountMatches;
  });

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };

  const dailyTransactionAmounts = selectedCustomer ? selectedCustomer.transactions.map(transaction => ({
    date: transaction.date,
    amount: transaction.amount,
  })) : [];

  useEffect(() => {
    if (selectedCustomer) {
      const chart = echarts.init(chartRef.current);
      const option = {
        xAxis: {
          type: 'category',
          data: dailyTransactionAmounts.map(transaction => transaction.date),
        },
        yAxis: {
          type: 'value',
        },
        series: [{
          data: dailyTransactionAmounts.map(transaction => transaction.amount),
          type: 'bar',
        }],
      };
      chart.setOption(option);
    }
  }, [selectedCustomer, dailyTransactionAmounts]);

  return (
    <div>
      <h1 className='m-5 Primary'>Customers and Transactions</h1>
      <input
        type="text"
        className='form-control w-50 text-center m-auto '
        value={filterText}
        onChange={e => {setFilterText(e.target.value);
            }}
        placeholder="Filter by customer name or transaction amount"
      />
      <p className="alert alert-primary w-25 p-0 mx-auto m-1" role="alert">Click on the row to see the graph </p>
      <table className="table m-4">
        <thead>
          <tr>
            <th>Customer ID</th>
            <th>Customer Name</th>
            <th>Transactions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomerTransactions.map(customer => (
            <tr key={customer.id} onClick={() => handleCustomerSelect(customer)}>
              <td>{customer.id}</td>
              <td>{customer.name}</td>
              <td>
                <ul class="list-unstyled">
                  {customer.transactions.map(transaction => (
                    <li key={transaction.id} >
                      Date: {transaction.date}, Amount: {transaction.amount}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedCustomer && (
        <div className='w-100 p-4'>
          <h2>Daily Transaction Amounts for {selectedCustomer.name}</h2>
          <div ref={chartRef} style={{ width: 100, height: 400 }} className='w-100' />
        </div>
      )}
    </div>
  );
};

export default CustomerTable;