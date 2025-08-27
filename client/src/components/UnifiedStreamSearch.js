import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import unifiedStreamerService from '../services/unifiedStreamerService';

const SearchContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const SearchTitle = styled.h3`
  color: white;
  margin: 0 0 15px 0;
  font-size: 18px;
  font-weight: 600;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
  }

  &::placeholder {
    color: #666;
  }
`;

const PlatformSelector = styled.div`
  display: flex;
  gap: 5px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 4px;
`;

const PlatformButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: ${props => props.active ? 
    (props.platform === 'kick' ? 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)' : 'linear-gradient(135deg, #9146ff 0%, #772ce8 100%)') : 
    'transparent'};
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;

  &:hover {
    background: ${props => props.active ? 
      (props.platform === 'kick' ? 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)' : 'linear-gradient(135deg, #9146ff 0%, #772ce8 100%)') : 
      'rgba(255, 255, 255, 0.1)'};
    color: white;
  }
`;

const AddButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SearchResults = styled.div`
  max-height: 300px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 10px;
`;

const ResultItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 5px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const ChannelAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const ChannelInfo = styled.div`
  flex: 1;
  color: white;
`;

const ChannelName = styled.div`
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
`;

const ChannelDetails = styled.div`
  font-size: 12px;
  opacity: 0.8;
`;

const PlatformBadge = styled.span`
  background: ${props => props.platform === 'kick' ? 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)' : 'linear-gradient(135deg, #9146ff 0%, #772ce8 100%)'};
  color: white;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
`;

const LoadingMessage = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
`;

const AutoDetectToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
`;

const ToggleLabel = styled.label`
  color: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToggleInput = styled.input`
  width: 16px;
  height: 16px;
`;

function UnifiedStreamSearch({ onAddStream }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('twitch');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoDetect, setAutoDetect] = useState(true);
  const searchTimeoutRef = useRef(null);

  const handleSearch = async (query, platform) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let results;
      
      if (autoDetect) {
        // Try to detect platform from query
        const detectedPlatform = unifiedStreamerService.detectPlatform(query);
        const cleanedQuery = unifiedStreamerService.cleanChannelName(query);
        
        // Try the detected platform first, then fallback to search
        try {
          const validation = await unifiedStreamerService.validateStreamer(cleanedQuery, detectedPlatform);
          if (validation.success && validation.exists) {
            results = {
              [detectedPlatform]: {
                channels: [validation.channel],
                total: 1
              }
            };
          } else {
            // If not found, search both platforms
            results = await unifiedStreamerService.searchAllPlatforms(cleanedQuery);
          }
        } catch (error) {
          // If validation fails, search both platforms
          results = await unifiedStreamerService.searchAllPlatforms(cleanedQuery);
        }
      } else {
        // Search specific platform
        const platformResults = await unifiedStreamerService.searchChannels(query, platform);
        results = {
          [platform]: platformResults
        };
      }

      // Combine results from all platforms
      const allChannels = [];
      Object.entries(results).forEach(([platform, data]) => {
        if (data.channels && Array.isArray(data.channels)) {
          allChannels.push(...data.channels);
        }
      });

      setSearchResults(allChannels);
    } catch (error) {
      console.error('Search error:', error);
      setError('Erro ao buscar streamers. Tente novamente.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      if (query.length >= 2) {
        handleSearch(query, selectedPlatform);
      } else {
        setSearchResults([]);
      }
    }, 500);
  };

  const handlePlatformChange = (platform) => {
    setSelectedPlatform(platform);
    if (searchQuery.length >= 2) {
      handleSearch(searchQuery, platform);
    }
  };

  const handleAddStream = async (channel) => {
    try {
      setIsLoading(true);
      setError('');

      // Get stream info
      const streamInfo = await unifiedStreamerService.getStreamInfo(channel.name, channel.platform);
      
      if (streamInfo.success) {
        const streamData = {
          id: `${channel.platform}-${channel.name}`,
          channel: channel.name,
          platform: channel.platform,
          displayName: channel.displayName || channel.name,
          avatar: channel.avatar,
          isLive: streamInfo.isLive,
          stream: streamInfo.stream
        };

        onAddStream(streamData);
        setSearchQuery('');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error adding stream:', error);
      setError('Erro ao adicionar stream. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdd = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      setError('');

      const cleanedQuery = unifiedStreamerService.cleanChannelName(searchQuery);
      const platform = autoDetect ? unifiedStreamerService.detectPlatform(searchQuery) : selectedPlatform;
      
      const streamInfo = await unifiedStreamerService.getStreamInfo(cleanedQuery, platform);
      
      if (streamInfo.success) {
        const streamData = {
          id: `${platform}-${cleanedQuery}`,
          channel: cleanedQuery,
          platform: platform,
          displayName: cleanedQuery,
          isLive: streamInfo.isLive,
          stream: streamInfo.stream
        };

        onAddStream(streamData);
        setSearchQuery('');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error adding stream:', error);
      setError('Streamer não encontrado. Verifique o nome e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <SearchContainer>
      <SearchTitle>Adicionar Stream</SearchTitle>
      
      <AutoDetectToggle>
        <ToggleLabel>
          <ToggleInput
            type="checkbox"
            checked={autoDetect}
            onChange={(e) => setAutoDetect(e.target.checked)}
          />
          Detectar plataforma automaticamente
        </ToggleLabel>
      </AutoDetectToggle>

      <SearchForm onSubmit={(e) => { e.preventDefault(); handleQuickAdd(); }}>
        <SearchInput
          type="text"
          placeholder="Digite o nome do streamer (ex: ninja, kick.com/streamer)"
          value={searchQuery}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        
        {!autoDetect && (
          <PlatformSelector>
            <PlatformButton
              type="button"
              platform="twitch"
              active={selectedPlatform === 'twitch'}
              onClick={() => handlePlatformChange('twitch')}
            >
              Twitch
            </PlatformButton>
            <PlatformButton
              type="button"
              platform="kick"
              active={selectedPlatform === 'kick'}
              onClick={() => handlePlatformChange('kick')}
            >
              Kick
            </PlatformButton>
          </PlatformSelector>
        )}
        
        <AddButton type="submit" disabled={isLoading || !searchQuery.trim()}>
          {isLoading ? 'Adicionando...' : 'Adicionar'}
        </AddButton>
      </SearchForm>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {isLoading && searchQuery.length >= 2 && (
        <LoadingMessage>Buscando streamers...</LoadingMessage>
      )}

      {searchResults.length > 0 && (
        <SearchResults>
          {searchResults.map((channel, index) => (
            <ResultItem key={`${channel.platform}-${channel.name}-${index}`} onClick={() => handleAddStream(channel)}>
              <ChannelAvatar 
                src={channel.avatar || `https://via.placeholder.com/40x40/333/fff?text=${channel.name.charAt(0).toUpperCase()}`} 
                alt={channel.name}
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/40x40/333/fff?text=${channel.name.charAt(0).toUpperCase()}`;
                }}
              />
              <ChannelInfo>
                <ChannelName>{channel.displayName || channel.name}</ChannelName>
                <ChannelDetails>
                  {channel.followers ? `${channel.followers.toLocaleString()} seguidores` : 'Streamer'} • 
                  <PlatformBadge platform={channel.platform}>{channel.platform}</PlatformBadge>
                </ChannelDetails>
              </ChannelInfo>
            </ResultItem>
          ))}
        </SearchResults>
      )}
    </SearchContainer>
  );
}

export default UnifiedStreamSearch;

