import React, { useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { SEARCH_PINGS_BY_ID, SEARCH_PINGS_BY_CREATOR, LIST_PENDING_PINGS } from '../../queries/queries';
import { UPDATE_PING } from '../../queries/mutations';
import BoardCard from './shared/BoardCard';
import './shared/BoardTools.css';

const PingManager = ({ searchState, setSearchState }) => {
    const [selectedPing, setSelectedPing] = useState(null);

    const [searchPings] = useLazyQuery(SEARCH_PINGS_BY_ID);
    const [searchByCreator] = useLazyQuery(SEARCH_PINGS_BY_CREATOR);
    const [listPendingPings] = useLazyQuery(LIST_PENDING_PINGS);
    const [updatePing] = useMutation(UPDATE_PING);

    const handleSearch = async () => {
        let response;
        switch (searchState.searchType) {
            case 'id':
                response = await searchPings({
                    variables: { id: searchState.searchTerm }
                });
                break;
            case 'creator':
                response = await searchByCreator({
                    variables: { profCreatorId: searchState.searchTerm }
                });
                break;
            default:
                return;
        }
        setSearchState(prev => ({
            ...prev,
            searchResults: response.data.listPings.items || []
        }));
    };

    const handlePendingPings = async () => {
        const response = await listPendingPings();
        setSearchState(prev => ({
            ...prev,
            searchResults: response.data.listPings.items || []
        }));
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

            <div className="results-grid">
                {searchState.searchResults.map(ping => (
                    <BoardCard
                        key={ping.id}
                        header={<h3>{ping.status} Ping</h3>}
                        content={
                            <>
                                <div>Type: {ping.type}</div>
                                <div>Request Details: {ping.instruction}</div>
                                <div>Related IDs:</div>
                                <ul>
                                    {ping.items.map((item, index) => (
                                        <li key={index}>{item}</li>
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