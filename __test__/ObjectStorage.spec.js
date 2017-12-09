'use strict';

const ObjectStorage = require('../lib/ObjectStorage');

describe('ObjectStorage', () => {
    describe('constructor', () => {
        it('should init with empty data property', () => {
            const objectStorage = new ObjectStorage();
            expect(Object.keys(objectStorage.data)).toHaveLength(0);
            expect(objectStorage.data).toBeInstanceOf(Object);
        });
    });

    describe('set', () => {
        it('should set value to data property', () => {
            const objectStorage = new ObjectStorage();
            objectStorage.set('prop', 'value');
            expect(objectStorage.get('prop')).resolves.toEqual('value');
        });

        it('should return resolved promise without value if TTL was specified', () => {
            const objectStorage = new ObjectStorage();
            expect(objectStorage.set('prop', 'value', 10)).resolves.toBeUndefined();
            expect(objectStorage.data.prop).toHaveProperty('ttl', 10);
            expect(objectStorage.data.prop).toHaveProperty('value', 'value');
        });

        it('should return resolved promise without value', () => {
            const objectStorage = new ObjectStorage();
            expect(objectStorage.set('prop', 'value')).resolves.toBeUndefined();
        });
    });

    describe('get', () => {
        it('should fetch value from data property', () => {
            const objectStorage = new ObjectStorage();
            objectStorage.set('prop', 'value');
            expect(objectStorage.get('prop')).resolves.toEqual('value');
        });

        it('should return undefined if value was not found', () => {
            const objectStorage = new ObjectStorage();
            expect(objectStorage.get('prop')).resolves.toBeUndefined();
        });
    });

    describe('del', () => {
        it('should delete value in data property', () => {
            const objectStorage = new ObjectStorage();
            objectStorage.set('prop', 'value');
            expect(objectStorage.get('prop')).resolves.toEqual('value');
            objectStorage.del('prop');
            expect(objectStorage.get('prop')).resolves.toBeUndefined();
        });

        it('should return resolved promise without value', () => {
            const objectStorage = new ObjectStorage();
            objectStorage.set('prop', 'value');
            expect(objectStorage.del('prop')).resolves.toBeUndefined();
        });
    })
});
