const PaymentSearchForm = ({ searchState, setSearchState, onSearch }) => {
  return (
    <div className="search-section">
      <div className="search-controls">
        <select
          value={searchState.searchType}
          onChange={(e) => setSearchState({
            ...searchState,
            searchType: e.target.value
          })}
        >
          <option value="paymentId">Payment ID</option>
          <option value="ownerId">Owner ID</option>
        </select>
        <input
          type="text"
          value={searchState.searchTerm}
          onChange={(e) => setSearchState({
            ...searchState,
            searchTerm: e.target.value
          })}
          onKeyPress={(e) => {
            if (e.key === 'Enter') onSearch();
          }}
          placeholder={`Search by ${searchState.searchType}...`}
        />
        <button onClick={onSearch}>Search</button>
      </div>
    </div>
  );
};

export default PaymentSearchForm;
