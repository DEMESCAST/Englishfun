// ==================== ENGLISH FUN - FIREBASE AUTHENTICATION ====================
// Copyright (c) 2026 DEMESCAST. Todos os direitos reservados.

const EFAuth = {
    currentUser: null,
    auth: null,

    init() {
        this.auth = firebase.auth();
        this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    },

    getCurrentUser() {
        return this.auth.currentUser;
    },

    getUid() {
        const user = this.auth.currentUser;
        return user ? user.uid : null;
    },

    isSignedIn() {
        return !!this.auth.currentUser;
    },

    normalizeNickname(name) {
        if (typeof name !== 'string') return '';
        return name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
    },

    deriveEmail(normalizedNickname) {
        return normalizedNickname + '@players.englishfun.invalid';
    },

    async createAccount(normalizedNickname, pin) {
        const email = this.deriveEmail(normalizedNickname);
        const userCredential = await this.auth.createUserWithEmailAndPassword(email, pin);
        return userCredential.user;
    },

    async signIn(normalizedNickname, pin) {
        const email = this.deriveEmail(normalizedNickname);
        const userCredential = await this.auth.signInWithEmailAndPassword(email, pin);
        return userCredential.user;
    },

    async signOut() {
        await this.auth.signOut();
        this.currentUser = null;
    },

    onAuthStateChanged(callback) {
        this.auth.onAuthStateChanged(callback);
    }
};
