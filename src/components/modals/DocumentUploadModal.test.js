import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useMutation } from '@apollo/client';
import { uploadData } from 'aws-amplify/storage';
import DocumentUploadModal from './DocumentUploadModal';

jest.mock('@apollo/client', () => ({
  useMutation: jest.fn(),
  gql: jest.fn()
}));

jest.mock('aws-amplify/storage', () => ({
  uploadData: jest.fn()
}));

describe('DocumentUploadModal public-only policy', () => {
  let createDocument;
  let updateDocument;
  let logSpy;
  let errorSpy;
  let mutationCall;

  beforeEach(() => {
    createDocument = jest.fn().mockResolvedValue({});
    updateDocument = jest.fn().mockResolvedValue({});
    mutationCall = 0;
    useMutation.mockReset().mockImplementation(() => {
      const result = mutationCall % 2 === 0 ? [createDocument] : [updateDocument];
      mutationCall += 1;
      return result;
    });
    uploadData.mockReset().mockReturnValue({
      result: Promise.resolve({ key: 'sensitive-upload-response-marker' })
    });
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('uploads and creates only PUBLIC metadata without logging file, key, or user markers', async () => {
    const marker = 'sensitive-user-marker';
    const { container } = render(
      <DocumentUploadModal
        user={{ username: marker }}
        onClose={jest.fn()}
        onSuccess={jest.fn()}
      />
    );

    expect(screen.queryByText(/Authenticated Users|Owners Only|Board Only|Treasurer Only|President Only/)).not.toBeInTheDocument();
    expect(container.querySelector('option[value="BOARD_ONLY"]')).not.toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('e.g., 2025 HOA Insurance Policy'), {
      target: { value: 'Synthetic public document' }
    });
    const file = new File(['synthetic'], 'sensitive-filename-marker.pdf', { type: 'application/pdf' });
    fireEvent.change(container.querySelector('input[type="file"]'), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => expect(createDocument).toHaveBeenCalledTimes(1));
    expect(uploadData).toHaveBeenCalledWith(expect.objectContaining({
      key: expect.stringMatching(/^documents\/\d+_sensitive-filename-marker\.pdf$/),
      options: expect.objectContaining({ accessLevel: 'public' })
    }));
    expect(createDocument.mock.calls[0][0].variables.input).toEqual(expect.objectContaining({
      accessLevel: 'PUBLIC',
      uploadedById: marker
    }));

    const consoleOutput = JSON.stringify([...logSpy.mock.calls, ...errorSpy.mock.calls]);
    expect(consoleOutput).not.toContain(marker);
    expect(consoleOutput).not.toContain('sensitive-filename-marker');
    expect(consoleOutput).not.toContain('sensitive-upload-response-marker');
  });

  test('forces a legacy non-PUBLIC edit to PUBLIC before metadata mutation', async () => {
    render(
      <DocumentUploadModal
        document={{
          id: 'document-marker',
          title: 'Legacy restricted document',
          category: 'OTHER',
          accessLevel: 'BOARD_ONLY',
          fileName: 'existing.pdf',
          fileType: 'application/pdf',
          s3Key: 'documents/existing.pdf',
          createdAt: '2026-08-18T00:00:00.000Z'
        }}
        user={{ username: 'synthetic-user' }}
        onClose={jest.fn()}
        onSuccess={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Update' }));
    await waitFor(() => expect(updateDocument).toHaveBeenCalledTimes(1));
    expect(updateDocument.mock.calls[0][0].variables.input.accessLevel).toBe('PUBLIC');
    expect(uploadData).not.toHaveBeenCalled();
  });
});
