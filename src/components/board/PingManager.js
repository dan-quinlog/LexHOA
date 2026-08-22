import React, { useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { SEARCH_PINGS_BY_ID, SEARCH_PINGS_BY_CREATOR, LIST_PENDING_PINGS } from '../../queries/queries';
import { UPDATE_PING } from '../../queries/mutations';
import BoardCard from './shared/BoardCard';
import { copyWithFeedback } from '../../utils/clipboardUtils';
import './shared/BoardTools.css';

const PingManager = ({ searchState, setSearchState }) => {
    const [searchError, setSearchError] = useState('');

    const [searchPings] = useLazyQuery(SEARCH_PINGS_BY_ID);
    const [searchByCreator] = useLazyQuery(SEARCH_PINGS_BY_CREATOR);
    const [listPendingPings] = useLazyQuery(LIST_PENDING_PINGS);
    const [updatePing] = useMutation(UPDATE_PING);

    const handleSearch = async () => {
        if (!searchState.searchTerm) return;
        setSearchError('');
        try {
            let searchResults;
            switch (searchState.searchType) {
                case 'id': {
                    const response = await searchPings({
                        variables: { id: searchState.searchTerm }
                    });
                    searchResults = response.data?.getPing ? [response.data.getPing] : [];
                    break;
                }
                case 'creator': {
                    const response = await searchByCreator({
                        variables: { profCreatorId: searchState.searchTerm }
                    });
                    searchResults = response.data?.pingsByCreator?.items || [];
                    break;
                }
                default:
                    return;
            }
            setSearchState(prev => ({
                ...prev,
                searchResults
            }));
        } catch (error) {
            console.error('Ping search failed');
            setSearchError('Unable to search pings. Please try again.');
        }
    };

    const handlePendingPings = async () => {
        setSearchError('');
        try {
            const response = await listPendingPings();
            setSearchState(prev => ({
                ...prev,
                searchResults: response.data?.listPings?.items || []
            }));
        } catch (error) {
            console.error('Pending ping search failed');
            setSearchError('Unable to search pings. Please try again.');
        }
    };

    const handleApprove = async (ping) => {
        await updatePing({
            variables: {
                input: {
                    id: ping.id,
                    status: "APPROVED"
                }
            }
        });
        handlePendingPings(); // Refresh the list
    };

    const handleReject = async (ping) => {
        await updatePing({
            variables: {
                input: {
                    id: ping.id,
                    status: "REJECTED"
                }
            }
        });
        handlePendingPings(); // Refresh the list
    };

    return (
        <div className="board-tool">
            <h2 className="section-title">Ping Management</h2>
            <div className="search-controls">
                <select
                    value={searchState.searchType}
                    onChange={(e) => setSearchState({
                        ...searchState,
                        searchType: e.target.value
                    })}
                    className="search-type"
                >
                    <option value="id">Ping ID</option>
                    <option value="creator">Creator ID</option>
                </select>
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchState.searchTerm}
                    onChange={(e) => setSearchState({
                        ...searchState,
                        searchTerm: e.target.value
                    })}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch();
                        }
                    }}
                    className="search-input"
                />
                <button onClick={handleSearch}>Search</button>
                <button onClick={handlePendingPings}>View Pending</button>
            </div>
            {searchError && <div role="alert">{searchError}</div>}

            <div className="results-grid">
                {searchState.searchResults.map(ping => (
                    <BoardCard
                        key={ping.id}
                        header={<h3>{ping.status} Ping</h3>}
                        content={
                            <>
                                <div>Type: {ping.type}</div>
                                <div>
                                    Requestor: {ping.profCreator?.name || ping.profCreatorId || 'None'}
                                    {ping.profCreatorId && (
                                        <button 
                                            className="copy-btn" 
                                            onClick={(e) => copyWithFeedback(ping.profCreatorId, e)}
                                            title="Copy Creator ID"
                                        >
                                            Copy
                                        </button>
                                    )}
                                </div>
                                <div>Request Details: {ping.instruction}</div>
                                <div>Related ID:</div>
                                <ul>
                                    {(ping.items || []).map((item, index) => (
                                        <li key={index}>
                                            {item}
                                            <button 
                                                className="copy-btn" 
                                                onClick={(e) => copyWithFeedback(item.split(':').pop(), e)}
                                                title="Copy ID"
                                            >
                                                Copy
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <div>Created: {new Date(ping.createdAt).toLocaleDateString()}</div>
                            </>
                        }
                        status={ping.status}
                        actions={
                            <>
                                <button onClick={() => handleApprove(ping)}>Approve</button>
                                <button onClick={() => handleReject(ping)}>Reject</button>
                            </>
                        }
                    />
                ))}
            </div>
        </div>
    );
};
export default PingManager;
