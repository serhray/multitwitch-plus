import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import StreamPlayer from './StreamPlayer';

const GridContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
  ${props => props.hasStreams ? `
    background: rgba(0, 0, 0, 0.2);
    border-radius: 15px;
    padding: 20px;
    backdrop-filter: blur(10px);
  ` : `
    background: transparent;
    padding: 0;
  `}
`;

const FocusedStreamContainer = styled(motion.div)`
  height: 60%;
  min-height: 400px;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const SecondaryStreamsContainer = styled.div`
  height: 40%;
  min-height: 300px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
`;

const Grid2x2Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 15px;
  height: 100%;
  min-height: 600px;
`;

const Grid2x2Item = styled(motion.div)`
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const SecondaryStreamWrapper = styled(motion.div)`
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const EmptyState = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  background: transparent;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h2`
  margin: 0 0 10px 0;
  font-size: 24px;
  color: rgba(255, 255, 255, 0.8);
`;

const EmptySubtitle = styled.p`
  margin: 0;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
`;

function StreamGrid({ streams, focusedStream, onStreamFocus, socket, currentRoom, layoutMode, onStreamRemove }) {
  // Ensure we always have a focused stream: fallback to the first one if none selected
  const effectiveFocusedId = focusedStream || (streams[0] && streams[0].id);
  const focusedStreamData = streams.find(stream => stream.id === effectiveFocusedId);
  const secondaryStreams = streams.filter(stream => stream.id !== effectiveFocusedId);

  if (streams.length === 0) {
    return (
      <GridContainer hasStreams={false}>
        <EmptyState
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <EmptyIcon>📺</EmptyIcon>
          <EmptyTitle>Nenhuma stream adicionada</EmptyTitle>
          <EmptySubtitle>Use a barra de pesquisa acima para adicionar streamers</EmptySubtitle>
        </EmptyState>
      </GridContainer>
    );
  }

  // Se só tem uma stream, ela fica sozinha no topo
  if (streams.length === 1) {
    return (
      <GridContainer hasStreams={true}>
        <FocusedStreamContainer
          key={focusedStreamData ? focusedStreamData.id : streams[0].id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <StreamPlayer
            stream={focusedStreamData}
            isFocused={true}
            layoutMode={layoutMode}
            onStreamRemove={onStreamRemove}
          />
        </FocusedStreamContainer>
      </GridContainer>
    );
  }

  // Layout 2/2 para 2+ streams
  if (layoutMode === '2/2') {
    return (
      <GridContainer hasStreams={true}>
        <Grid2x2Container>
          <AnimatePresence>
            {streams.slice(0, 4).map((stream, index) => (
              <Grid2x2Item
                key={stream.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => onStreamFocus(stream.id)}
              >
                <StreamPlayer
                  stream={stream}
                  isFocused={stream.id === focusedStream}
                  layoutMode={layoutMode}
                  onStreamRemove={onStreamRemove}
                />
              </Grid2x2Item>
            ))}
          </AnimatePresence>
        </Grid2x2Container>
      </GridContainer>
    );
  }

  return (
    <GridContainer hasStreams={true}>
      <AnimatePresence mode="wait">
        {focusedStreamData && (
          <FocusedStreamContainer
            key={focusedStream}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <StreamPlayer
              stream={focusedStreamData}
              isFocused={true}
              layoutMode={layoutMode}
              onStreamRemove={onStreamRemove}
            />
          </FocusedStreamContainer>
        )}
      </AnimatePresence>

      {secondaryStreams.length > 0 && (
        <SecondaryStreamsContainer>
          <AnimatePresence>
            {secondaryStreams.slice(0, 3).map((stream) => (
              <SecondaryStreamWrapper
                key={stream.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                onClick={() => onStreamFocus(stream.id)}
              >
                <StreamPlayer
                  stream={stream}
                  isFocused={false}
                  layoutMode={layoutMode}
                  onStreamRemove={onStreamRemove}
                />
              </SecondaryStreamWrapper>
            ))}
          </AnimatePresence>
        </SecondaryStreamsContainer>
      )}
    </GridContainer>
  );
}

export default StreamGrid;
