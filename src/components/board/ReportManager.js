import React, { useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { PROFILE_BALANCES } from '../../queries/queries';
import { copyWithFeedback } from '../../utils/clipboardUtils';
import { formatCurrency } from '../../utils/payments';
import './shared/BoardTools.css';
import './ReportManager.css';

const BOARD_GROUP = process.env.REACT_APP_BOARD_GROUP_NAME;

// Each report lists the Cognito groups allowed to run it (any one is enough),
// how to load its rows, and the columns to display.
const REPORTS = [
  {
    id: 'profileBalances',
    label: 'Profile Balances',
    groups: [BOARD_GROUP],
    run: async (client) => {
      const profiles = [];
      let nextToken = null;
      do {
        const { data } = await client.query({
          query: PROFILE_BALANCES,
          variables: { limit: 1000, nextToken },
          fetchPolicy: 'network-only'
        });
        profiles.push(...data.listProfiles.items.filter(Boolean));
        nextToken = data.listProfiles.nextToken;
      } while (nextToken);
      return profiles.sort((a, b) => (b.balance || 0) - (a.balance || 0));
    },
    columns: [
      {
        header: 'Owner Name',
        cell: (profile) => (
          <>
            {profile.name}
            <button
              type="button"
              className="report-copy-link"
              onClick={(e) => copyWithFeedback(profile.id, e)}
              title="Copy Profile ID"
            >
              Copy ID
            </button>
          </>
        )
      },
      { header: 'Email', cell: (profile) => profile.email },
      { header: 'Balance', className: 'report-amount', cell: (profile) => formatCurrency(profile.balance) }
    ]
  }
];

// The selected report and its results live in Board so they survive switching tools.
const ReportManager = ({ reportState, setReportState, userGroups = [] }) => {
  const client = useApolloClient();
  const reports = REPORTS.filter((report) => report.groups.some((group) => userGroups.includes(group)));
  const reportId = reportState.reportId || reports[0]?.id || '';
  const { result } = reportState;
  const setReportId = (value) => setReportState((prev) => ({ ...prev, reportId: value }));
  const setResult = (value) => setReportState((prev) => ({ ...prev, result: value }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runReport = async () => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;
    setLoading(true);
    setError(null);
    try {
      setResult({ report, rows: await report.run(client) });
    } catch (err) {
      console.error('Report error:', err);
      setResult(null);
      setError('Unable to run report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="board-tool">
      <h2 className="section-title">Reports</h2>
      {reports.length === 0 ? (
        <p>You don't have access to any reports.</p>
      ) : (
        <div className="search-controls">
          <select
            aria-label="Report"
            className="search-type"
            value={reportId}
            onChange={(e) => {
              setReportId(e.target.value);
              setResult(null);
            }}
          >
            {reports.map((report) => (
              <option key={report.id} value={report.id}>{report.label}</option>
            ))}
          </select>
          <button type="button" onClick={runReport} disabled={loading}>
            {loading ? 'Running...' : 'Run Report'}
          </button>
        </div>
      )}
      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="report-results">
          <h3>{result.report.label} ({result.rows.length})</h3>
          <div className="report-table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  {result.report.columns.map((column) => (
                    <th key={column.header} className={column.className}>{column.header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id}>
                    {result.report.columns.map((column) => (
                      <td key={column.header} className={column.className}>{column.cell(row)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManager;
