import { createClient } from '@insforge/sdk';

const insforge = createClient({
    baseUrl: 'https://xz4vtsxd.us-west.insforge.app',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTMyNDZ9._I5uDHIW2mW-Lx5p4O9JYGRm0DpHYCmgTCWNg7I5xXE',
});

export default insforge;
