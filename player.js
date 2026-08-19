// ==================== ENGLISH FUN - PLAYER MANAGEMENT ====================

const EFPlayer = {
    CHARS: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',

    generateCode() {
        const segments = [];
        for (let s = 0; s < 3; s++) {
            let segment = '';
            const randomValues = new Uint8Array(4);
            crypto.getRandomValues(randomValues);
            for (let i = 0; i < 4; i++) {
                segment += this.CHARS[randomValues[i] % this.CHARS.length];
            }
            segments.push(segment);
        }
        return 'EF-' + segments[0].slice(0, 4) + '-' + segments[1].slice(0, 2) + segments[2].slice(0, 2);
    },

    async createPlayer(uid, nickname, normalizedNickname, pin, dbRef) {
        const code = this.generateCode();

        await dbRef.ref('players/' + uid).set({
            nickname: nickname,
            normalizedNickname: normalizedNickname,
            playerCode: code,
            createdAt: Date.now()
        });

        return { code: code };
    },

    async getProfile(uid, dbRef) {
        try {
            const snapshot = await dbRef.ref('players/' + uid).once('value');
            return snapshot.val();
        } catch(e) {
            return null;
        }
    },

    validateNickname(value) {
        if (typeof value !== 'string') return { valid: false, error: 'Escolha um apelido de 2 a 16 caracteres.' };

        let nick = value.trim().replace(/\s+/g, ' ');
        nick = nick.replace(/[\x00-\x1f\x7f]/g, '');

        if (nick.length < 2) return { valid: false, error: 'O apelido precisa ter pelo menos 2 caracteres.' };
        if (nick.length > 16) return { valid: false, error: 'O apelido pode ter no máximo 16 caracteres.' };
        if (/<.*>/.test(nick)) return { valid: false, error: 'O apelido não pode conter caracteres HTML.' };

        return { valid: true, value: nick };
    },

    validatePin(value) {
        if (typeof value !== 'string') return { valid: false, error: 'O PIN deve ter 6 dígitos.' };
        if (!/^\d{6}$/.test(value)) return { valid: false, error: 'O PIN deve ter exatamente 6 números.' };
        return { valid: true, value: value };
    }
};
