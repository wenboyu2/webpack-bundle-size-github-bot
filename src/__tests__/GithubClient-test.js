const GithubClient = require('../GithubClient');

let mockAuthenticate = jest.fn();
let mockCompareCommits = jest.fn();
let mockSearchIssues = jest.fn();
jest.mock('@octokit/rest', () => {
    return function() {
        return {
            authenticate: mockAuthenticate,
            repos: {
                compareCommits: mockCompareCommits,
                getCommits: () => {}
            },
            search: {
                issues: mockSearchIssues
            },
            issues: {
                getComments: () => {}
            },
            pullRequests: {
                getAll: () => {}
            }
        };
    };
});

describe('GithubClient', () => {
    afterEach(() => {
        mockAuthenticate = jest.fn();
        mockCompareCommits = jest.fn();
        mockSearchIssues = jest.fn();
    });

    describe('constructor()', () => {
        test('should call authenticate', () => {
            new GithubClient();

            expect(mockAuthenticate).toHaveBeenCalled();
        });
    });

    describe('getMergeBaseCommit()', () => {
        let gc;
        const sha = 'sha123';

        beforeEach(() => {
            gc = new GithubClient();
        });

        test('should call compareCommits()', async () => {
            mockCompareCommits.mockReturnValue(
                Promise.resolve({
                    data: {
                        merge_base_commit: {
                            sha
                        }
                    }
                })
            );
            const res = await gc.getMergeBaseCommit(123);

            expect(mockCompareCommits).toHaveBeenCalled();
            expect(res).toEqual(sha);
        });
    });
});
