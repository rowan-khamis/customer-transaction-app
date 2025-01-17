import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const CustomerTable = () => {
  const [customers, setCustomers] = useState([]); // state to store customers data
  const [transactions, setTransactions] = useState([]); // state to store transactions data
  const [filterText, setFilterText] = useState(''); // state to store filter text
  const [selectedCustomer, setSelectedCustomer] = useState(null); // state to store selected customer
  const chartRef = useRef(null); // ref to store chart element

  /**
   * Fetch customers and transactions data from API
   */
  useEffect(() => {
    fetchCustomersAndTransactions();
  }, []);

  /**
   * Fetch customers and transactions data from API
   */
  const fetchCustomersAndTransactions = async () => {
    try {
      const [customersResponse, transactionsResponse] = await Promise.all([
        fetch('http://localhost:8000/customers'),
        fetch('http://localhost:8000/transactions'),
      ]);

      const customersData = await customersResponse.json();
      const transactionsData = await transactionsResponse.json();

      setCustomers(customersData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  /**
   * Get customer transactions by mapping customers to their transactions
   */
  const getCustomerTransactions = () => {
    return customers.map((customer) => {
      const customerTransactions = transactions.filter(
        (transaction) => transaction.customer_id === parseInt(customer.id)
      );
      return { ...customer, transactions: customerTransactions };
    });
  };

  /**
   * Filter customer transactions based on filter text
   */
  const filterData = (customerTransactions) => {
    return customerTransactions.filter((customer) => {
      const customerNameMatches = customer.name.toLowerCase().includes(filterText.toLowerCase());
      const transactionAmountMatches = customer.transactions.some(
        (transaction) => transaction.amount === parseInt(filterText, 10)
      );
      return customerNameMatches || transactionAmountMatches;
    });
  };

  /**
   * Handle customer selection by setting selected customer state
   */
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };

  /**
   * Get daily transaction amounts for selected customer
   */
  const getDailyTransactionAmounts = () => {
    if (!selectedCustomer) return [];
    return selectedCustomer.transactions.map((transaction) => ({
      date: transaction.date,
      amount: transaction.amount,
    }));
  };

  /**
   * Update chart with daily transaction amounts for selected customer
   */
  useEffect(() => {
    if (selectedCustomer) {
      const chart = echarts.init(chartRef.current);
      const option = {
        xAxis: {
          type: 'category',
          data: getDailyTransactionAmounts().map((transaction) => transaction.date),
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            data: getDailyTransactionAmounts().map((transaction) => transaction.amount),
            type: 'bar',
          },
        ],
      };
      chart.setOption(option);
    }
  }, [selectedCustomer]);

  return (
    <div>
      <h1 className="m-5 Primary">Customers and Transactions</h1>
      <input
        type="text"
        className="form-control w-50 text-center m-auto"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        placeholder="Filter by customer name or transaction amount"
      />
      <p className="alert alert-primary w-25 p-0 mx-auto m-1" role="alert">
        Click on the row to see the graph
      </p>
      <table className="table m-4">
        <thead>
          <tr>
            <th>Customer ID</th>
            <th>Customer Name</th>
            <th>Transactions</th>
          </tr>
        </thead>
        <tbody>
          {filterData(getCustomerTransactions()).map((customer) => (
            <tr key={customer.id} onClick={() => handleCustomerSelect(customer)}>
              <td>{customer.id}</td>
              <td>{customer.name}</td>
              <td>
                <ul className="list-unstyled">
                  {customer.transactions.map((transaction) => (
                    <li key={transaction.id}>
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
        <div className="w-100 p-4">
          <h2>Daily Transaction Amounts for {selectedCustomer.name}</h2>
          <div ref={chartRef} style={{ width: 100, height: 400 }} className='w-100' />
        </div>
      )}
    </div>
  );
};

export default CustomerTable;